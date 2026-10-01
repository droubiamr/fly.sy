// __Host-: the browser only accepts it with Secure, Path=/ and no Domain, so no subdomain can set or shadow it.
// Its own module so worker.ts can tell a signed-in admin's request apart without loading the sign-in code.
export const SESSION_COOKIE = "__Host-fsy_admin"
