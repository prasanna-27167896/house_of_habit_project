import { AuthErrors } from "./auth.errors";
import { UserErrors } from "./user.errors";
import { CategoryErrors } from "./category.errors";
import { BrandErrors } from "./brand.errors";
import { ProductErrors } from "./product.errors";
import { WishlistErrors } from "./wishlist.errors";
import { CartErrors } from "./cart.errors";
import { AddressErrors } from "./address.errors";
import { CouponErrors } from "./coupon.errors";
import { OrderErrors } from "./order.errors";
import { ReviewErrors } from "./review.errors";
import { ContactErrors } from "./contact.errors";
import { FaqErrors } from "./faq.errors";
import { PaymentErrors } from "./payment.errors";
import { UploadErrors } from "./upload.errors";
import { CommonErrors } from "./common.errors";

export const Errors = {
  ...AuthErrors,
  ...UserErrors,
  ...CategoryErrors,
  ...BrandErrors,
  ...ProductErrors,
  ...WishlistErrors,
  ...CartErrors,
  ...AddressErrors,
  ...CouponErrors,
  ...OrderErrors,
  ...ReviewErrors,
  ...ContactErrors,
  ...FaqErrors,
  ...PaymentErrors,
  ...UploadErrors,
  ...CommonErrors,
};
