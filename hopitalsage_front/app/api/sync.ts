// api/sync.ts (backend Next.js)
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const body = await request.json();
  const direction = body.direction;
  const debug = body.debug ?? false;

  if (direction !== 'remote_to_local' && direction !== 'local_to_remote') {
    return NextResponse.json({ error: 'Direction invalide' }, { status: 400 });
  }

  try {
    // Commande docker selon la direction
    const dockerCmd = direction === 'remote_to_local'
      ? 'docker compose exec backend python hopitalsage_front/sync_remote_to_local.py'
      : 'docker compose exec backend python hopitalsage_front/sync_local_to_remote.py';

    let stdout = '';
    let stderr = '';

    if (debug) {
      const { stdout: out, stderr: err } = await execAsync(dockerCmd, {
        maxBuffer: 1024 * 1024 * 10,
      });
      stdout = out;
      stderr = err;
    } else {
      await execAsync(dockerCmd + ' > /dev/null 2>&1', {
        maxBuffer: 1024 * 1024 * 10,
      });
    }

    const now = new Date().toLocaleString('fr-FR', {
      timeZone: 'Africa/Kinshasa',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return NextResponse.json({
      success: true,
      message: `✅ Synchronisation terminée avec succès le ${now}`,
      ...(debug && { logs: stdout || stderr || 'Aucun log disponible.' }),
    });
  } catch (error: any) {
    console.error('Erreur pendant la synchronisation :', error);
    return NextResponse.json(
      {
        success: false,
        error: '❌ Une erreur est survenue pendant la synchronisation.',
        ...(debug && { logs: error.stderr || error.message }),
      },
      { status: 500 }
    );
  }
}
