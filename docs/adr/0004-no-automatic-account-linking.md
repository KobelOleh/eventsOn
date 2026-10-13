# No automatic linking of Google and password accounts

When a Google sign-in has the same email as a password account (or the reverse), sign-in is refused with a message naming the method to use; `allowDangerousEmailAccountLinking` stays off. Registration does not verify email ownership, so automatic linking would allow pre-hijacking: an attacker registers a victim's email with a password, then keeps access after the victim signs in with Google. The linking policy lives in one function in the `auth` module, so verified-email linking or a "connect Google" profile flow can replace it later.
