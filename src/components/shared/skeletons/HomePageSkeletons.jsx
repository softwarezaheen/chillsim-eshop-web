import { Skeleton } from "@mui/material";

export const CountriesSkeletons = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(9)
        .fill()
        .map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={100}
            className="rounded-lg"
          />
        ))}
    </div>
  );
};

export const BundlesSkeletons = () => {
  return Array.from({ length: 6 }).map((_, index) => (
    <div key={index} className="flex flex-col gap-4 p-4 border rounded-lg">
      <Skeleton variant="rectangular" width="100%" height={150} />
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="40%" height={20} />
    </div>
  ));
};

export const FAQSkeletons = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <div key={index} className="flex flex-col gap-4 p-4 border rounded-lg">
      <Skeleton variant="rectangular" width="100%" height={50} />
      <Skeleton variant="text" width="60%" height={20} />
    </div>
  ));
};

//for faq and aboutus
export const ContentSkeletons = () => {
  return (
    <div className="flex flex-col gap-[2rem]">
      <div className="flex flex-col gap-3 max-w-xxl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-[#14213D] mb-8">
            <Skeleton variant="text" height={50} width={200} />
          </h1>
          <p className="text-xl text-gray-600 text-center leading-relaxed">
            <Skeleton
              variant="text"
              width="80%"
              height={30}
              className={"m-auto"}
            />
          </p>
        </div>
      </div>

      <div className="max-w-xxl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Skeleton variant="rectangular" width="100%" height={200} />
      </div>
    </div>
  );
};
