import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import { execFile } from 'node:child_process'

function ffmpegRemuxPlugin() {
  return {
    name: 'ffmpeg-remux-plugin',
    configureServer(server) {
      server.middlewares.use('/api/remux-video', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const filename = req.headers['x-filename'] || 'CaptioniX_Export.mp4';
        const isTransparent = req.headers['x-is-transparent'] === 'true' || filename.toLowerCase().endsWith('.mov');
        const sourceCodec = req.headers['x-source-codec'] || 'vp9';
        const stamp = Date.now();
        const ext = isTransparent ? 'mov' : 'mp4';
        const tmpIn = `/tmp/captions_in_${stamp}.webm`;
        const tmpOut = `/tmp/captions_out_${stamp}.${ext}`;
        const writeStream = fs.createWriteStream(tmpIn);

        req.pipe(writeStream);

        writeStream.on('error', (err) => {
          console.error('[Stream Write Error]', err);
          res.statusCode = 500;
          res.end('Failed to write stream: ' + err.message);
        });

        writeStream.on('finish', () => {
          try {
            const targetFps = req.headers['x-fps'] || '30';
            const is4K = req.headers['x-is-4k'] === 'true';
            const crfVal = req.headers['x-crf'] || (is4K ? '15' : '16');

            let args;
            if (isTransparent) {
              // Decoder selection: libvpx-vp9 for VP9, libvpx for VP8 to extract alpha channel
              const decoder = sourceCodec.toLowerCase().includes('vp8') ? 'libvpx' : 'libvpx-vp9';
              // Apple ProRes 4444 (profile 4) with yuva444p10le:
              // The universal industry standard recognized natively by CapCut (Desktop), Premiere, DaVinci, Final Cut
              args = [
                '-y',
                '-c:v', decoder,
                '-i', tmpIn,
                '-vf', `fps=${targetFps},setpts=N/(${targetFps}*TB),scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuva444p10le`,
                '-fps_mode', 'cfr',
                '-c:v', 'prores_ks',
                '-profile:v', '4444',
                '-pix_fmt', 'yuva444p10le',
                '-map', '0:v:0',
                '-map', '0:a:0?',
                '-c:a', 'aac',
                '-b:a', '256k',
                '-movflags', '+faststart',
                tmpOut
              ];
            } else {
              // Encode to universal standard H.264 + AAC MP4 with monotonic PTS & Rec.709 colors
              args = [
                '-y',
                '-i', tmpIn,
                '-vf', `fps=${targetFps},setpts=N/(${targetFps}*TB),scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p`,
                '-fps_mode', 'cfr',
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', crfVal,
                '-pix_fmt', 'yuv420p',
                '-colorspace', 'bt709',
                '-color_primaries', 'bt709',
                '-color_trc', 'bt709',
                '-color_range', 'tv',
                '-map', '0:v:0',
                '-map', '0:a:0?',
                '-c:a', 'aac',
                '-b:a', '256k',
                '-af', 'aresample=async=1',
                '-movflags', '+faststart',
                tmpOut
              ];
            }

            execFile('ffmpeg', args, (err, stdout, stderr) => {
              if (err) {
                console.error('[FFmpeg Remux Error]', err, stderr);
                try { fs.unlinkSync(tmpIn); } catch {}
                try { fs.unlinkSync(tmpOut); } catch {}
                res.statusCode = 500;
                res.end('FFmpeg conversion failed: ' + err.message);
                return;
              }

              if (fs.existsSync(tmpOut)) {
                const stat = fs.statSync(tmpOut);
                res.setHeader('Content-Type', isTransparent ? 'video/quicktime' : 'video/mp4');
                res.setHeader('Content-Length', stat.size);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                
                const readStream = fs.createReadStream(tmpOut);
                readStream.pipe(res);
                readStream.on('close', () => {
                  try { fs.unlinkSync(tmpIn); } catch {}
                  try { fs.unlinkSync(tmpOut); } catch {}
                });
              } else {
                try { fs.unlinkSync(tmpIn); } catch {}
                res.statusCode = 500;
                res.end('FFmpeg output file missing');
              }
            });
          } catch (e) {
            console.error('[Remux Handler Error]', e);
            try { fs.unlinkSync(tmpIn); } catch {}
            try { fs.unlinkSync(tmpOut); } catch {}
            res.statusCode = 500;
            res.end('Internal server error: ' + e.message);
          }
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ffmpegRemuxPlugin()],
})
