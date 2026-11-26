
declare module "midtrans-client" {
  class Snap {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });

    createTransaction(parameter: Record<string, unknown>): Promise<{
      token: string;
      redirect_url: string;
    }>;
  }

  class CoreApi {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey?: string;
    });

    transaction: {
      status(orderId: string): Promise<Record<string, unknown>>;
    };
  }

  export { Snap, CoreApi };
  // CommonJS default export (interop)
  export default { Snap, CoreApi };
}
