export default function PaymentDetails ({ paymentInfo }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 py-8 px-6 rounded-md bg-white border dark:border-slate-500 dark:bg-slate-700 dark:text-white bg-opacity-75 dark:bg-opacity-75 backdrop-blur-sm dark:backdrop-blur-sm">
      <p className="w-full md:w-2/5">{paymentInfo.paymentMessage}</p>
      <div className="flex flex-col max-md:w-full md:grow items-center gap-2">
        {Object.keys(paymentInfo).length > 0 &&
          Object.keys(paymentInfo.paymentAccountDetails).map((key) => (
            <div className="flex flex-row w-full justify-between" key={key}>
              <p className="font-medium">{key}</p>
              <p>{paymentInfo.paymentAccountDetails[key]}</p>
            </div>
          ))}
      </div>
    </div>
  );
};