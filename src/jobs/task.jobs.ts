import cron from "node-cron";
import { runTaskLifecycle } from "../services/taskService";

// Runs every hour
cron.schedule("*/1 * * * *", async () => {
  console.log("Running task lifecycle job...");

  try {
    // const now = new Date();

    // // Expire tasks not claimed in 24 hours
    // const expiredTasks = await TaskModel.updateMany(
    //   {
    //     status: "OPEN",
    //     createdAt: { $lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    //   },
    //   { $set: { status: "EXPIRED" } }
    // );
    // console.log(`Expired tasks updated: ${expiredTasks.modifiedCount}`);

    // // Reopen tasks claimed but not completed in 48 hours
    // const reopenedTasks = await TaskModel.updateMany(
    //   {
    //     status: "IN_PROGRESS",
    //     claimedAt: { $lte: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
    //   },
    //   { $set: { status: "OPEN", assignedTo: null, claimedAt: null } }
    // );
    // console.log(`Reopened tasks updated: ${reopenedTasks.modifiedCount}`);
    await runTaskLifecycle();
  } catch (err) {
    console.error("Error running task lifecycle job:", err);
  }
});
