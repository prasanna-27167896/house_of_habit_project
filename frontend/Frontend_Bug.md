# Frontend Issues

This file lists every problem found by comparing the frontend code against the real
backend (HohBE). Every backend endpoint mentioned here already exists, works, and has
been tested live — you can look up the exact request/response shape for any of them at
`http://localhost:3006/api/docs` (Swagger) if anything below is unclear.

The list is in two parts:
- **Part 1: Real bugs** — broken right now, should be fixed.
- **Part 2: Not connected yet** — screens still using placeholder/fake data. Normal for
  a build in progress, not urgent, but needs wiring up before launch. One of these
  (photo uploads) involves a pattern — uploading straight to Cloudflare storage — that's
  easy to get wrong if you haven't done it before, so that one is explained in full.

---

## Part 1: Real bugs

### 1. Verifying the OTP code fails every time

**File:** `src/store/slices/authSlice.js`, function `verifyOtp`

**What the code does now:**
```js
const response = await api.post("/auth/verifyOtp", { email, otp: Number(otp) });
```
It puts the email inside the request body (the JSON payload).

**Why that's wrong:** the backend doesn't read the email from the body for this
endpoint. It expects the email to be part of the web address (URL) itself:

```
POST /auth/verifyOtp/john@example.com
```

Since the app calls `/auth/verifyOtp` with no email in the URL, the backend has no idea
whose OTP this is, and the route doesn't even match — it returns a 404 "not found"
error, every single time.

**The fix:**
```js
const response = await api.post(
  `/auth/verifyOtp/${encodeURIComponent(email)}`,
  { otp: Number(otp) }
);
```
(`encodeURIComponent` just makes sure special characters like `@` and `+` in the email
don't break the URL.)

**One more thing to know:** even after this fix, this particular endpoint only confirms
"yes, you own this email" during sign-up. It replies with just a message
(`{ message: "Email verified successfully." }`) — no account info, no login token. It
does not log the person in. That's expected — see bug #3 for the part that actually
handles login.

---

### 2. The OTP input box is too short for the actual code

**File:** `src/components/common/Popup/OtpStep.jsx`, line 5

```js
// Set to 4 digits as per backend schema
const OTP_LENGTH = 4;
```

**Why that's wrong:** that comment is incorrect — the backend was never a 4-digit
system. It always generates a random 6-digit number (e.g. `482913`) and only accepts a
6-digit number back. This is the same for every OTP in the system: sign-up
verification, login, and forgot-password all use 6 digits.

Because the input UI only has 4 boxes, a real code (6 digits) can never be typed in
fully — the "Verify" button will never see a correct value.

**The fix:** change `OTP_LENGTH` to `6`, and make sure the OTP-box row in the UI has 6
boxes instead of 4 (check the CSS/layout doesn't assume 4).

---

### 3. Existing customers have no way to log back in

**Files:** `src/store/slices/authSlice.js`, `src/components/common/Popup/AuthPopup.jsx`

**What the code does now:** the popup only knows one path — "send a sign-up OTP, verify
it, then ask for name and phone to create a new account." There is no code anywhere
that calls a login endpoint.

**What actually happens if an existing customer tries to log in:** they type their
email → the app calls the sign-up-OTP endpoint (`sendVerificationOtp`) → the backend
replies "this email is already registered" (a 409 error) → the flow just stops there.
The customer never even sees an OTP box, and there is no way for them to get past this
screen.

**The backend has a completely separate, already-working login system that the
frontend just never calls:**

| Step | Endpoint | What it needs | What it gives back |
|---|---|---|---|
| 1. Ask for a login code | `POST /auth/login/otp/send?email=...` | Email as a URL query parameter (e.g. `?email=john@example.com`), no body needed | Always a generic `200 OK` with a message — even if the email doesn't exist, on purpose (so people can't use this to guess who's registered) |
| 2. Submit the code | `POST /auth/login/otp/verify/john@example.com` | Body: `{ otp: 482913 }` | On success: `{ user: {...}, accessToken: "..." }` — this is a real, logged-in session |

**How to wire this in, step by step, without changing what the customer sees on
screen:**

1. Customer types their email into the same EMAIL step that exists today.
2. Call the sign-up endpoint first, like today: `sendVerificationOtp(email)`.
   - **If it succeeds** → this is a brand-new customer. Continue exactly as the app
     does today: show the OTP box → verify via `/auth/verifyOtp/:email` → show the
     "enter your name and phone" step → call `/auth/register`.
   - **If it fails with "already registered" (409)** → this is a returning customer.
     Instead, call `POST /auth/login/otp/send?email=...`, then show the *same* OTP box
     component (no UI change needed). When they submit the code, call
     `POST /auth/login/otp/verify/:email` instead of the sign-up verify endpoint. This
     call gives back `{ user, accessToken }` directly — log them in immediately and
     skip the "name and phone" step, since they already have an account.
3. The only real code change needed: remember which of the two situations you're in
   (e.g. a `flow` variable set to `"register"` or `"login"` right after step 2), so
   that when the customer submits the OTP box, the app knows which of the two "verify"
   endpoints to call.
4. Add two new functions (following the same pattern as the existing
   `sendVerificationOtp`/`verifyOtp`), for example `sendLoginOtp` and `verifyLoginOtp`,
   that call the two login endpoints above.

---

### 4. A piece of code that can never actually run

**File:** `src/store/slices/authSlice.js`, inside `verifyOtp.fulfilled`

```js
const { user, accessToken } = action.payload.data || action.payload;
if (user && accessToken) {
  // treat this as "existing user, log them in"
} else {
  // treat this as "new user, show the name/phone step"
}
```

**Why this is a problem:** this code is trying to guess whether someone is a new or
existing user by checking what came back from the sign-up-verify call. But as explained
in bug #1, that call never returns a `user` or `accessToken` — it only ever returns a
plain message. So the `if` branch here is unreachable; it will never fire. This looks
like it was written assuming one shared "smart" endpoint that doesn't actually exist on
the backend.

**The fix:** once bug #3 is done properly, this whole check can be deleted. The app
will already know for certain whether it's doing a login or a sign-up (because it chose
which endpoint to call), so there's no need to guess from the response shape anymore.

---

### 5. The "Delete my account" button calls something that was never built

**Files:** `authSlice.js` (function `deleteUserAccount`), and the UI for it,
`DeleteAccountPopup.jsx`

```js
const response = await api.delete("/user/delete");
```

**Why this fails:** this route simply does not exist on the backend, and that's
intentional, not an oversight. Accounts are never permanently deleted in this system —
an admin can lock/ban a user, but the account record itself always stays, because
deleting it would also break the order history tied to it (orders, invoices, etc. need
to keep pointing to a real user). Calling this endpoint will always fail with a 404.

**The fix:** remove the "Delete my account" button and its popup for now. If a real
"remove my account" feature is wanted later, that needs a new backend endpoint to be
designed and built first (e.g. something that anonymizes/deactivates rather than
deletes) — it doesn't exist today, so there's nothing for the frontend to call yet.

---

### 6. Two different places are both trying to track "is the user logged in?"

**Files:** `src/store/slices/authSlice.js` (a Redux store) and
`src/store/useAuthStore.js` (a separate Zustand store)

**What's happening:** the app has two independent systems both storing the same kind of
information — who's logged in, their user info, their access token — and both read and
write to the same browser storage keys. They don't know about each other.

**Why this is a problem:** actions in one don't automatically update the other. For
example, `logoutUser` (in the Redux store) clears the Redux side, but never tells the
Zustand store to also log out. So any part of the app that happens to be reading from
`useAuthStore` instead of Redux could keep showing the user as "logged in" even after
they've logged out. This kind of bug is very easy to miss during testing and very
confusing for users when it shows up.

**The fix:** pick one system and remove the other entirely. The Redux `authSlice` is
the more complete one — it already has all the sign-up/login/logout logic built as
async actions — so keep that, delete `useAuthStore.js`, and update any component that
currently reads from it to read from the Redux store (`state.auth`) instead.

---

## Part 2: Not connected yet (expected during build, but needed before launch)

These screens run without errors, but they're showing made-up/placeholder data instead
of talking to the real backend. That's a normal stage to be at while building — this
section is just here so none of it gets forgotten later.

### 7. Orders, Returns, and Exchanges show fake data

**Files:** `OrdersPanel.jsx`, `ReturnItemView.jsx`, `SizeExchangeView.jsx` — all of
these import a fake list of orders from `src/data/ordersData.js` instead of asking the
backend for the real ones.

Endpoints ready to use once this gets connected:

| What the customer wants to do | Endpoint to call |
|---|---|
| See their past orders | `GET /orders` (supports filtering by status, date range, and search) |
| See one order's full details | `GET /orders/:orderId` |
| Cancel an order | `PUT /orders/:orderId/cancel` |
| Ask to return an item | `POST /orders/:orderId/return` |
| Ask to exchange an item for a different size | `POST /orders/:orderId/exchange` |
| See delivery tracking steps (placed → shipped → delivered) | `GET /orders/:orderId/track` |
| Download the invoice as a PDF | `GET /orders/:orderId/invoice` |
| Rate how the delivery went | `POST /orders/:orderId/delivery-feedback` |

(Exact fields each one needs are in the Swagger docs — search for "Orders" there.)

---

### 8. Writing a product review doesn't go anywhere yet

There's currently no code that calls `POST /reviews/product/:productId` to actually
submit a review. One rule to know about: a customer can only leave a review for a
product they've actually bought and received — the backend will reject the request
otherwise.

---

### 9. Uploading a photo with a review — this needs a two-step process, not a normal file upload

This is the one worth explaining carefully, because it's a different pattern than a
typical "send the file to our server" upload, and it's easy to build wrong if you
haven't seen it before.

**The key thing to understand: the photo does NOT get uploaded to the HoH backend at
all.** It gets uploaded directly from the customer's browser straight to Cloudflare's
file storage (called "R2"). The HoH backend is only involved in the very first step, to
hand out a special, temporary upload link. After that, the backend is completely out of
the picture for the actual file transfer.

**Why it works this way (just for context, not required reading to implement it):**
sending the photo to our own server first, and then having our server forward it to
storage, would mean the file travels through our server twice and uses up its bandwidth
for no reason. Instead, the browser is given permission to upload the file straight to
storage in one hop. This is a very common pattern (it's how most apps handle file
uploads to cloud storage), it's just not something you'd guess without being told.

**The exact steps to follow:**

**Step 1 — Ask the HoH backend for a one-time upload link.**

```js
const presignRes = await api.post("/upload/presign-review", {
  contentType: file.type,      // e.g. "image/jpeg" — must be one of: image/jpeg, image/png, image/webp
  fileSize: file.size,         // size in bytes — max 5MB (5 * 1024 * 1024)
});

const { signedUrl, key, publicUrl } = presignRes.data.data;
```

- `signedUrl` — a special, temporary web address (valid for 15 minutes) that the
  browser is allowed to upload the file to directly.
- `key` — the internal filename/path the file will be stored under.
- `publicUrl` — the permanent web address the photo will be viewable at, once uploaded.

**Step 2 — Upload the actual file straight to that link. Do NOT send this through
`api` (your normal axios instance) — this goes directly to Cloudflare, not to the HoH
backend.**

```js
await fetch(signedUrl, {
  method: "PUT",
  body: file,                                   // the raw File object, not FormData
  headers: { "Content-Type": file.type },        // must match what you sent in Step 1
});
```

**Important details that are easy to get wrong here:**
- Use plain `fetch` (or plain `axios.put`, but NOT your `api` instance from
  `axiosInstance.js`) — that instance automatically attaches your login token as an
  `Authorization` header, and CORS/Content-Type settings meant for our own backend.
  None of that should be sent to Cloudflare; it can actually cause the upload to be
  rejected.
- Send the raw `file` object as the body — not wrapped in `FormData`, and don't
  JSON-stringify it.
- The `Content-Type` header on this PUT request must exactly match the `contentType`
  value you sent in Step 1 (e.g. if you said `image/jpeg` there, send that same value
  here) — a mismatch will make Cloudflare reject the upload.
- There's no response body to read on success — just check that the request didn't
  throw an error / didn't come back with a failure status.

**Step 3 — Now submit the review, including the photo info you got in Step 1.**

```js
await api.post(`/reviews/product/${productId}`, {
  rating: 5,
  title: "Great fit",
  body: "Really happy with this.",
  imageUrl: publicUrl,   // from Step 1
  imageKey: key,         // from Step 1
});
```

`imageUrl` and `imageKey` must always be sent together — either both present, or both
left out entirely. Sending only one of them will be rejected.

**Summary of the whole flow:**
Browser asks HoH backend for permission → HoH backend hands back a temporary link →
browser uploads the photo directly to Cloudflare using that link → browser tells HoH
backend "here's the link to the photo I just uploaded" as part of submitting the review.
The HoH backend never touches the actual image file at any point.

---

### 10. "Best Sellers" on the homepage isn't actually showing best sellers

**File:** `src/components/home/BestSellers/BestSellers.jsx` (via `fetchHomeProducts` in
`productSlice.js`)

**What it does now:** it fetches a general list of products grouped by category, then
shuffles them into a random order in the browser. Whatever appears in the "Best
Sellers" section right now is random, not based on actual sales.

**What's available instead:** `GET /products/best-selling?limit=10` — this returns
products actually sorted by how many units have sold (orders that were cancelled don't
count), with a `unitsSold` number attached to each one.

**The fix:** add a function to call this endpoint (same pattern as the other product
fetch functions already in `productService.js`), and have `BestSellers.jsx` use that
instead of the random shuffle.

---

## Everything else is fine

Products, Cart, Addresses, Payments, Categories, FAQs, and Contact forms were all
checked line by line against the backend and are correctly wired up. No changes needed
there.
