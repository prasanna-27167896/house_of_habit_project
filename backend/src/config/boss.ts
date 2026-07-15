import PgBoss from "pg-boss";
import { env } from "@config/env";
import { logger } from "@utils/logger";
import { sweepExpiredReservations } from "@repos/reservation.repo";
import { deleteStaleSessions } from "@repos/auth.repo";

// Postgres-backed job scheduler (pg-boss). Survives restarts and won't double-run
// across multiple server instances — the reason we use it over a bare setInterval.
const RESERVATION_SWEEP_QUEUE = "reservation-sweep";
const EVERY_15_MIN = "*/15 * * * *";

// Purge expired/revoked sessions so the table stays bounded (every login is a row and
// multi-device means several per user). Daily is plenty — stale rows are inert.
const SESSION_CLEANUP_QUEUE = "session-cleanup";
const DAILY_3AM = "0 3 * * *";

let boss: PgBoss | null = null;

export const startJobs = async (): Promise<void> => {
  boss = new PgBoss(env.DATABASE_URL);
  boss.on("error", (err) => logger.error({ err }, "pg-boss error"));

  await boss.start();
  await boss.createQueue(RESERVATION_SWEEP_QUEUE);

  // Worker: reclaim stock from abandoned checkouts.
  await boss.work(RESERVATION_SWEEP_QUEUE, async () => {
    const result = await sweepExpiredReservations();
    if (result.released > 0 || result.ordersCancelled > 0) {
      logger.info(
        result,
        "Reservation sweep: stock released / abandoned orders cancelled",
      );
    }
  });

  // Run every 15 minutes.
  await boss.schedule(RESERVATION_SWEEP_QUEUE, EVERY_15_MIN);

  // Worker: purge expired/revoked sessions.
  await boss.createQueue(SESSION_CLEANUP_QUEUE);
  await boss.work(SESSION_CLEANUP_QUEUE, async () => {
    const { count } = await deleteStaleSessions();
    if (count > 0) logger.info({ count }, "Session cleanup: stale sessions purged");
  });
  await boss.schedule(SESSION_CLEANUP_QUEUE, DAILY_3AM);

  logger.info(
    "pg-boss started — reservation sweep every 15 min, session cleanup daily at 03:00",
  );
};

export const stopJobs = async (): Promise<void> => {
  if (boss) {
    await boss.stop();
    boss = null;
  }
};
