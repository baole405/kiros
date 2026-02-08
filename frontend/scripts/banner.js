const os = require("os");
const figlet = require("figlet");
const gradient = require("gradient-string");

// Clean Console
console.clear();

// Create Banner
const msg = "KIROS  SYSTEM";

figlet(msg, (err, data) => {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }

  // Print with Gradient (Pastel / Teen / Mind)
  console.log(gradient.pastel.multiline(data));

  console.log(gradient.atlas("\n   🚀  AI TRIAGE & RECOVERY HUB  🚀\n"));
  console.log(gradient.morning("   ----------------------------------\n"));
  console.log(`   📦  Build Process: Next.js Production Build`);
  console.log(`   🖥️   System: ${os.type()} ${os.release()} (${os.arch()})`);
  console.log(`   ⚙️   Node.js: ${process.version}`);
  console.log(`   📅  Time: ${new Date().toLocaleString()}`);
  console.log("\n");
});
