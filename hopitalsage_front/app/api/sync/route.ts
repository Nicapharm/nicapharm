// app/api/sync/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { direction, debug = false } = body;

    // Vérifier la direction
    if (!['remote_to_local', 'local_to_remote'].includes(direction)) {
      return NextResponse.json(
        { success: false, error: "❌ 'direction' doit être 'remote_to_local' ou 'local_to_remote'" },
        { status: 400 }
      );
    }

    // Construction dynamique de la commande
    const script = direction === 'remote_to_local'
      ? 'sync_remote_to_local.py'
      : 'sync_local_to_remote.py';

    const command = `docker compose exec backend python hopitalsage_front/${script}`;

    let stdout = '';
    let stderr = '';

    if (debug) {
      const result = await execAsync(command, { maxBuffer: 1024 * 1024 * 20 });
      stdout = result.stdout;
      stderr = result.stderr;
    } else {
      await execAsync(`${command} > /dev/null 2>&1`, { maxBuffer: 1024 * 1024 * 20 });
    }

    // Date Kinshasa
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
      direction,
      message: `✅ Synchronisation (${direction}) effectuée avec succès le ${now}`,
      ...(debug && { logs: stdout || stderr || 'ℹ️ Aucun log généré.' }),
    });

  } catch (error: any) {
    console.error('❌ Erreur pendant la synchronisation :', error);
    return NextResponse.json(
      {
        success: false,
        error: '❌ Échec de la synchronisation.',
        logs: error.stderr || error.message,
      },
      { status: 500 }
    );
  }
}
