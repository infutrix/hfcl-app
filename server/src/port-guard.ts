import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';

/**
 * Resolves false when `host:port` cannot be bound. EACCES is treated as busy
 * too: on Windows it is what a port inside a reserved (excluded) range gives.
 */
export function isPortFree(port: number, host: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
        resolve(false);
      } else {
        reject(error);
      }
    });
    probe.once('listening', () => probe.close(() => resolve(true)));
    probe.listen(port, host);
  });
}

/**
 * True when the process answering on `baseUrl` is another copy of this agent,
 * recognised by the shape of its `/discovery/status` response.
 */
export async function isHfclAgent(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/discovery/status`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return false;
    const body: unknown = await response.json();
    return (
      typeof body === 'object' &&
      body !== null &&
      'mainServer' in body &&
      'aiServer' in body
    );
  } catch {
    return false;
  }
}

/**
 * Shows a blocking Windows error dialog. The packaged app runs in a console
 * window that closes as soon as the process exits, so a console message alone
 * is never seen by the operator. Title and text are passed through environment
 * variables to avoid quoting them into the PowerShell command.
 */
export function showErrorDialog(title: string, message: string): void {
  if (process.platform !== 'win32') return;

  const script = [
    'Add-Type -AssemblyName System.Windows.Forms',
    '[void][System.Windows.Forms.MessageBox]::Show(' +
      '$env:HFCL_DIALOG_MESSAGE, $env:HFCL_DIALOG_TITLE, ' +
      '[System.Windows.Forms.MessageBoxButtons]::OK, ' +
      '[System.Windows.Forms.MessageBoxIcon]::Error, ' +
      '[System.Windows.Forms.MessageBoxDefaultButton]::Button1, ' +
      '[System.Windows.Forms.MessageBoxOptions]::DefaultDesktopOnly)',
  ].join('; ');

  spawnSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', script],
    {
      env: {
        ...process.env,
        HFCL_DIALOG_TITLE: title,
        HFCL_DIALOG_MESSAGE: message,
      },
      stdio: 'ignore',
      windowsHide: true,
    },
  );
}
