import cron from "node-cron";
import { runTaskLifecycle } from "../services/taskService";

// Runs every hour
cron.schedule("*/10 * * * *", async () => {
  console.log("Running task lifecycle job...");

  try {
    await runTaskLifecycle();
  } catch (err) {
    console.error("Error running task lifecycle job:", err);
  }
});
