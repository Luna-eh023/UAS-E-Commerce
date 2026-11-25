export default function DashboardBanner() {
  return (
    <section className="bg-success text-white rounded-4 p-4 p-md-5 mb-4 overflow-hidden">
      <div className="row align-items-center">
        <div className="col-md-8">
          <span className="badge bg-light text-success mb-3">
            DIGEBOY STORE
          </span>

          <h1 className="fw-bold display-6">
            Semua Gadget,
            <br />
            Satu Tempat!
          </h1>

          <p className="mb-4">
            Temukan aksesoris dan perangkat elektronik favoritmu
            dengan mudah di Digeboy.
          </p>

          <a
            href="#produk"
            className="btn btn-light text-success fw-semibold px-4"
          >
            Jelajahi Produk
          </a>
        </div>

        <div className="col-md-4 text-center mt-4 mt-md-0">
          <div className="display-1">
            <span role="img" aria-label="Belanja">
              🛍️
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}