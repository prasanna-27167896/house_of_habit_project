# Frontend Issues — Explained Simply

This file lists problems found by comparing the frontend code against the real backend
(HohBE). Every backend link mentioned here already works and has been tested — you can
check any of it live at `http://localhost:3006/api/docs` (Swagger).

The list is in two parts:
- **Part 1: Real bugs** — things that are broken and should be fixed.
- **Part 2: Not connected yet** — screens still using placeholder data. This is normal
  for a build-in-progress and isn't urgent, but these need to be wired up to the real
  backend before launch.

---

## Part 1: Real bugs

### 1. Verifying the OTP code doesn't work

**File:** `src/store/slices/authSlice.js` (`verifyOtp`)

Right now the app sends the email as part of the request body:
```js
api.post("/auth/verifyOtp", { email, otp })
```

But the backend expects the email to be part of the web address itself, like this:
```js
api.post(`/auth/verifyOtp/${email}`, { otp })
```

Because of this mismatch, this call currently fails every time (404 error).

Also worth knowing: this specific endpoint only confirms "yes, this email belongs to
you" during sign-up. It does not log the person in — it just returns a simple success
message.

---

### 2. The OTP box only lets you type 4 numbers, but the code is 6 digits

**File:** `src/components/common/Popup/OtpStep.jsx`, line 5

```js
const OTP_LENGTH = 4;
```

The backend always sends a 6-digit code (something like `482913`). Since the input box
only has room for 4 digits, nobody can ever type in a correct code.

**Fix:** change `4` to `6`.

---

### 3. There's no way for an existing customer to log back in

**Files:** `authSlice.js`, `AuthPopup.jsx`

Right now the app only knows how to sign someone up as a **new** customer. There's no
code anywhere that calls the "log in" endpoints.

If someone who already has an account tries to log in by typing their email, the app
tries to register them as if they were new — and the backend immediately says "this
email is already registered" and stops. The person never even gets to see an OTP box.

**The backend already has a proper log-in-with-OTP flow that the app just isn't using:**

- `POST /auth/login/otp/send?email=...` → sends a login code to that email
- `POST /auth/login/otp/verify/:email` → checks the code, and if correct, logs the
  person in (gives back their account info + an access token)

**Simple way to fix this**, without changing what the customer sees:

1. Customer types their email like today.
2. Try the sign-up email step first (`sendVerificationOtp`).
   - If it works → this is a **new** customer → keep doing exactly what happens today
     (OTP → fill in name/phone → done).
   - If it says "already registered" → this is an **existing** customer → instead call
     the login endpoints above, show the same OTP box, and log them straight in (no
     need to ask for name/phone again).
3. The app just needs to remember which of the two situations it's in, so it knows
   which "verify OTP" endpoint to call when the customer submits the code.

---

### 4. Leftover code that can never actually run

**File:** `authSlice.js`, inside `verifyOtp`

There's a check that says "if the response includes a user and a token, log them in."
This can never happen for this particular call — as explained in bug #1, this endpoint
never sends back a user or a token. It's dead code left over from an earlier idea.

Once bug #3 is fixed properly, this check isn't needed anymore — the app will already
know whether it's doing a login or a signup, without needing to guess from the response.

---

### 5. "Delete my account" button doesn't work, and isn't supposed to

**Files:** `authSlice.js` (`deleteUserAccount`), `DeleteAccountPopup.jsx`

This calls `DELETE /user/delete`, but that doesn't exist on the backend — on purpose.
Accounts are never deleted, only locked/banned by an admin, so that order history isn't
lost.

**Fix:** remove this button and the popup for now. If a "delete my account" feature is
genuinely needed later, that has to be built on the backend first — it doesn't exist
today.

---

### 6. Two separate systems are both trying to remember "is the user logged in?"

**Files:** `authSlice.js` (Redux) and `useAuthStore.js` (Zustand)

The app has two different places tracking login state at the same time, and they don't
talk to each other. For example, logging out through one might not update the other —
so parts of the app could still think the user is logged in when they're not.

**Fix:** pick one (Redux's `authSlice` is more complete) and delete the other one.

---

## Part 2: Not connected yet (fine for now, but needs doing before launch)

These screens work, but they're showing fake/placeholder data instead of talking to the
real backend. That's expected while still building — flagging them here so they don't
get forgotten.

### 7. Orders, Returns, and Exchanges show fake data

**Files:** `OrdersPanel.jsx`, `ReturnItemView.jsx`, `SizeExchangeView.jsx` — these all
pull from a fake data file (`data/ordersData.js`) instead of the real backend.

When ready, here's what's available to connect to:

| What it does | Endpoint |
|---|---|
| See your order history | `GET /orders` |
| See one order's details | `GET /orders/:orderId` |
| Cancel an order | `PUT /orders/:orderId/cancel` |
| Ask to return an item | `POST /orders/:orderId/return` |
| Ask to exchange an item | `POST /orders/:orderId/exchange` |
| See delivery tracking steps | `GET /orders/:orderId/track` |
| Download the invoice (PDF) | `GET /orders/:orderId/invoice` |
| Rate the delivery experience | `POST /orders/:orderId/delivery-feedback` |

(Full details on what each one needs are in the Swagger docs.)

### 8. Writing a product review doesn't send anywhere yet

There's no code that calls the real "submit a review" endpoint
(`POST /reviews/product/:productId`) yet. One thing to know: a customer can only review
a product they've actually bought and received.

### 9. Uploading a photo with a review isn't connected yet

There's no code calling the endpoint that lets a customer upload a review photo
(`POST /upload/presign-review`). This gives a special upload link — the photo gets sent
straight to storage, then the review is submitted with a link to that photo.

### 10. "Best Sellers" on the homepage is just random products

**File:** `BestSellers.jsx`

Right now this section grabs a bunch of products and shuffles them randomly — it's not
actually showing what's selling best.

There's a real "best sellers" endpoint ready to use: `GET /products/best-selling` — it
returns products sorted by how many have actually been sold.

---

## Everything else is fine

Products, Cart, Addresses, Payments, Categories, FAQs, and Contact forms were all
checked and are correctly wired up to the backend. No changes needed there.
