export type Voucher = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxDiscount?: number;
};

export const VOUCHERS: Voucher[] = [
  {
    code: "GEBOY10",
    type: "percentage",
    value: 10,
    minPurchase: 100000,
    maxDiscount: 50000,
  },
  {
    code: "GEBOY20",
    type: "percentage",
    value: 20,
    minPurchase: 250000,
    maxDiscount: 100000,
  },
  {
    code: "HEMAT50",
    type: "fixed",
    value: 50000,
    minPurchase: 300000,
  },
];

export function validateVoucher(
  code: string,
  subtotal: number
) {
  const normalizedCode = code.trim().toUpperCase();

  const voucher = VOUCHERS.find(
    (item) => item.code === normalizedCode
  );

  if (!voucher) {
    return {
      valid: false,
      message: "Kode voucher tidak ditemukan.",
      discount: 0,
      voucher: null,
    };
  }

  if (subtotal < voucher.minPurchase) {
    return {
      valid: false,
      message: `Minimum belanja ${new Intl.NumberFormat(
        "id-ID",
        {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }
      ).format(voucher.minPurchase)}.`,
      discount: 0,
      voucher: null,
    };
  }

  let discount = 0;

  if (voucher.type === "percentage") {
    discount = subtotal * (voucher.value / 100);

    if (voucher.maxDiscount !== undefined) {
      discount = Math.min(discount, voucher.maxDiscount);
    }
  } else {
    discount = voucher.value;
  }

  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    message: "Voucher berhasil digunakan!",
    discount,
    voucher,
  };
}