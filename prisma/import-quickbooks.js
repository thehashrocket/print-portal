// Quickbooks Import Script
import { importData } from "../src/services/importQuickbooksData.js";

importData()
  .then(() => {
    console.log("Import completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  }); 