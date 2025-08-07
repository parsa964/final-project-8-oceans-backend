// Start both services and gateway in the same process
import { spawn } from "child_process";

console.log("Starting backend services...");

// Start the main services (index.ts)
const services = spawn("bun", ["run", "index.ts"], {
  stdio: "inherit",
  shell: true
});

// Wait a bit for services to start up
setTimeout(() => {
  console.log("Starting API Gateway...");
  
  // Start the gateway
  const gateway = spawn("bun", ["run", "gateway.ts"], {
    stdio: "inherit",
    shell: true
  });
  
  gateway.on("error", (err) => {
    console.error("Gateway error:", err);
    process.exit(1);
  });
}, 5000);

services.on("error", (err) => {
  console.error("Services error:", err);
  process.exit(1);
});

// Handle shutdown
process.on("SIGINT", () => {
  console.log("Shutting down...");
  services.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Shutting down...");
  services.kill();
  process.exit(0);
});