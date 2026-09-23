// Generates the admin sign-in secrets:  npm run admin:setup
//   ADMIN_PASSWORD_HASH  PBKDF2-SHA256 hash of a password you type (never stored or printed in clear)
//   ADMIN_TOTP_SECRET    a new authenticator secret, with the otpauth:// link to add it to your app
// The password must be 12+ characters and absent from the Have I Been Pwned breach corpus, checked with its
// k-anonymity range API: only the first 5 hex characters of the SHA-1 leave this machine.
// Pass --keep-totp to hash a new password without replacing the authenticator secret.
import { createHash } from "node:crypto"
import { hashPassword, newTotpSecret, totpFor } from "../src/lib/auth-crypto.ts"

function ask(prompt) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process
    stdout.write(prompt)
    if (!stdin.isTTY) {
      let buf = ""
      stdin.setEncoding("utf8").on("data", (d) => (buf += d)).on("end", () => resolve(buf.split(/\r?\n/)[0]))
      return
    }
    let value = ""
    stdin.setRawMode(true).resume().setEncoding("utf8")
    const onData = (ch) => {
      if (ch === "\r" || ch === "\n") {
        stdin.setRawMode(false).pause().off("data", onData)
        stdout.write("\n")
        resolve(value)
      } else if (ch === "\u0003") process.exit(1)
      else if (ch === "\u007f") value = value.slice(0, -1)
      else value += ch
    }
    stdin.on("data", onData)
  })
}

async function pwnedCount(password) {
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase()
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${sha1.slice(0, 5)}`, { headers: { "Add-Padding": "true" } })
    const line = (await res.text()).split("\n").find((l) => l.startsWith(sha1.slice(5)))
    return line ? Number(line.split(":")[1]) : 0
  } catch {
    return null
  }
}

const password = await ask("Admin password (12+ characters, hidden): ")
if (password.length < 12 || password.length > 256) {
  console.error("Use between 12 and 256 characters. A passphrase of four or five random words is ideal.")
  process.exit(1)
}
const pwned = await pwnedCount(password)
if (pwned === null) console.warn("Could not reach the breach check (api.pwnedpasswords.com); continuing without it.")
else if (pwned > 0) {
  console.error(`That password appears in ${pwned.toLocaleString("en")} known breaches. Choose another.`)
  process.exit(1)
}

const hash = await hashPassword(password)
console.log(`\nADMIN_PASSWORD_HASH=${hash}`)
if (!process.argv.includes("--keep-totp")) {
  const secret = newTotpSecret()
  console.log(`ADMIN_TOTP_SECRET=${secret}`)
  console.log(`\nAdd it to your authenticator app (1Password, Google Authenticator, Aegis…) with this link or the secret above:\n${totpFor(secret).toString()}`)
}
console.log(`
Local development: put the lines above in .dev.vars (wrangler) or .env.local (next dev).
Production:        npx wrangler secret put ADMIN_PASSWORD_HASH${process.argv.includes("--keep-totp") ? "" : "\n                   npx wrangler secret put ADMIN_TOTP_SECRET"}`)
