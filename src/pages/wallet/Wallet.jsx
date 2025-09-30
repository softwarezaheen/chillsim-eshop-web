//UTILITIES
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
//COMPONENTS
import WalletCard from "../../components/wallet/WalletCard";
import VoucherCard from "../../components/wallet/VoucherCard";
import WalletTransactions from "../../components/wallet/WalletTransactions";
import { Skeleton } from "@mui/material";
import NoDataFound from "../../components/shared/no-data-found/NoDataFound";
import { NoDataFoundSVG } from "../../assets/icons/Common";
//REDUCER
import { fetchUserInfo } from "../../redux/reducers/authReducer";

const Wallet = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user_info, isLoading } = useSelector((state) => state.authentication);
  const { user_currency } = useSelector((state) => state.currency);

  // Refetch user info when currency changes
  useEffect(() => {
    if (user_currency?.currency) {
      dispatch(fetchUserInfo());
    }
  }, [user_currency?.currency, dispatch]);

  // Show loading
  if (isLoading) {
    return (
      <div className="flex flex-col gap-[2rem]">
        <div className="flex items-center justify-between gap-[2rem]">
          <Skeleton variant="text" width={200} height={40} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
          <Skeleton variant="rectangular" height={200} className="rounded-md" />
          <Skeleton variant="rectangular" height={200} className="rounded-md" />
        </div>
      </div>
    );
  }

  // Show if no user info
  if (!user_info) {
    return (
      <div className="flex flex-col gap-[2rem]">
        <div className="flex items-center justify-between gap-[2rem]">
          <h1 className="font-bold">{t("nav.myWallet")}</h1>
        </div>
        <NoDataFound
          text={t("wallet.loadingBalance")}
          image={<NoDataFoundSVG />}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[2rem] p-4">
      <div className="flex items-center justify-between gap-[2rem]">
        <h1 className="text-2xl font-bold">{t("nav.myWallet", "My Wallet")}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
        <WalletCard userInfo={user_info} />
        <VoucherCard />
      </div>

      <WalletTransactions />
    </div>
  );
};

export default Wallet;