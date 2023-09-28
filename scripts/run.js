import { createServer, build, loadEnv } from 'vite'
import { fork } from 'child_process'
import fs from 'fs'
import { join } from 'path'

let app
let networkDisable = false

const startMain = async () => {
  if (app) {
    app.removeAllListeners()
    app.kill("SIGTERM");
  }
  await build({
    configFile: "vite.backend.config.ts",
    mode: "development"
  })

  const args = process.argv.slice(2)
  if (networkDisable) args.push("--disable-network")

  app = fork("dist/backend/main.cjs", args, { stdio: ['inherit', 'inherit', 'inherit', 'ipc'], windowsHide: false });

  app.on('close', function (code, signal) {
    if (code === null && signal !== "SIGINT") {
      console.error('App exited with signal', signal);
      process.exit(1);
    }
    process.exit(code);
  });
}

const closeApp = (signal) => {
  if (app && !app.killed) {
    app.kill(signal);
  }
}

const _ = (num) => {
  if (num < 10) return "0"+num
  return num.toString()
}

const printElectron = () => {
  process.stdout.write("\x1b[90m")
  const date = new Date();
  process.stdout.write(`${date.getHours()}:${_(date.getMinutes())}:${_(date.getSeconds())}`)
  process.stdout.write("\x1b[96m")
  process.stdout.write(" [electron] ")
  process.stdout.write("\x1b[90m")
}

const watch = process.argv.includes("--watch")
let timeout = null
const onMainChange = () => {
  if (timeout) return
  timeout = setTimeout(() => {
    timeout = null
  }, watch? 200: 5000)

  printElectron()
  if (!watch) {
    process.stdout.write("files in main have been changed. ")
    process.stdout.write("\x1b[32m")
    process.stdout.write("Use 'r' to restart app")
  } else {      
    process.stdout.write("app reload")
    startMain()
  }
  process.stdout.write("\x1b[0m \n")
}

const init = async () => {

  const env = loadEnv("development", process.cwd(), 'VITE')
  const renderer = await createServer({
    configFile: "vite.frontend.config.ts"
  })
  Object.assign(renderer.config.env, env)

  await startMain()
  
  const frontendServer = await renderer.listen()

  console.clear()
  process.stdout.write("App successfull launched!✨\n\n")
  process.stdout.write("\x1b[32m")
  process.stdout.write("Use 'r' to restart app\n")
  process.stdout.write("Use 'o' to open browser page\n")
  process.stdout.write("Use 'q' to quit\n")
  if (watch) {
    process.stdout.write("\x1b[90m")
    process.stdout.write("\nApp will restart automatically when changes are made to the main\n")
  }
  
  process.stdout.write("\x1b[0m")
  
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.setEncoding( 'utf8' );
  process.stdin.on('data', ( key ) => {
    // ctrl-c ( end of text )
    if ( key === '\u0003' ) {
      process.exit();
    }

    if (key === "r" || key === "к") {
      startMain()
    }
    if (key === "q" || key === "й") {
      closeApp("SIGINT")
    }
    if (key === "d" || key === "в") {
      networkDisable = !networkDisable
      app.send(networkDisable? "net:disable": "net:enable")
    }

    if (key === "o" || key === "щ") {
      frontendServer.openBrowser()
    }
  });
  
  process.on("SIGINT", () => closeApp("SIGINT"));
  process.on("SIGTERM", () => closeApp("SIGTERM"));
  
  fs.watch("src/backend", { recursive: true }, onMainChange)
}

init()