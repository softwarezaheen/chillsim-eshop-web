import React from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getOrderByID } from "../../../core/apis/userAPI";

const OrderDetails = () => {
  const { id } = useParams();
  const userInfo = useSelector((state) => state.authentication.user_info);

  const { data, isLoading, error } = useQuery({
    queryKey: [`${userInfo?.id}-${id}-bundles`, id],
    queryFn: () => getOrderByID(id),
    enabled: !!id,
  });

  console.log(data, "dataaaaaaaaaaaaaaaa");

  return <div>OrderDetails {id}</div>;
};

export default OrderDetails;
