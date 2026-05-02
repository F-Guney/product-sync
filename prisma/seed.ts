export const DEMO_USER_ID = "demo-user";

async function main() {
  console.log(`Seed complete. DEMO_USER_ID=${DEMO_USER_ID}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
