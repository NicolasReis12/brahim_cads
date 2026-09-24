export default function Loading() {
  return (
    <div className="container-page pt-4 md:pt-8" aria-busy="true" aria-label="Carregando produto">
      <div className="skeleton mb-4 h-3 w-48 rounded-xs" />
      <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="skeleton aspect-square" />
        <div className="flex flex-col gap-4">
          <div className="skeleton h-3 w-32 rounded-xs" />
          <div className="skeleton h-9 w-full rounded-xs" />
          <div className="skeleton h-9 w-2/3 rounded-xs" />
          <div className="skeleton mt-4 h-10 w-40 rounded-xs" />
          <div className="skeleton h-3 w-28 rounded-xs" />
          <div className="skeleton mt-4 h-12 w-full rounded-sm" />
          <div className="skeleton h-12 w-full rounded-sm" />
        </div>
      </div>
    </div>
  );
}
