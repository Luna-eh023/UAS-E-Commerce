
import "server-only";

// midtrans-client adalah CommonJS module (module.exports = { Snap, CoreApi, ... })
// Gunakan require untuk interop yang aman dengan Turbopack
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client") as {
  Snap: new (opts: {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }) => {
    createTransaction(
      param: Record<string, unknown>
    ): Promise<{ token: string; redirect_url: string }>;
  };
  CoreApi: new (opts: {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }) => {
    transaction: {
      status(orderId: string): Promise<Record<string, unknown>>;
    };
  };
};

export function createSnap() {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  });
}

export function createCoreApi() {
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });
}
