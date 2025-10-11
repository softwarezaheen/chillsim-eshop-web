import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircularProgress, Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { getInvoicePDF } from '../core/apis/authAPI';

const Invoice = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const downloadInvoiceAndRedirect = async () => {
      try {
        if (!invoiceId) {
          toast.error(t('orders.invoiceDownloadError'));
          navigate('/');
          return;
        }

        // Download the PDF automatically
        const response = await getInvoicePDF(invoiceId);
        
        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Extract filename from Content-Disposition header or use default
        let filename = `invoice_${invoiceId}.pdf`;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) {
            filename = match[1];
          }
        }
        
        // Create download link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        URL.revokeObjectURL(url);
        
        toast.success(t('orders.invoiceDownloaded'));
        
        // Redirect to home or orders page after download
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
        
      } catch (error) {
        console.error('Error downloading invoice:', error);
        toast.error(t('orders.invoiceDownloadError'));
        
        // Redirect to home on error
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    downloadInvoiceAndRedirect();
  }, [invoiceId, navigate, t]);

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen p-4">
      <CircularProgress size={60} />
      <Typography variant="h6" className="mt-4 text-center">
        {t('orders.downloadingInvoice', 'Downloading invoice...')}
      </Typography>
      <Typography variant="body2" className="mt-2 text-center text-gray-600">
        {t('orders.redirectingAfterDownload', 'You will be redirected shortly...')}
      </Typography>
    </Box>
  );
};

export default Invoice;