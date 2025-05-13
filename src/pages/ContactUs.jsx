import React, { useState, useEffect } from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ContactForm from "../components/ContactForm";
import { getFAQContent } from "../core/apis/homeAPI";
import { useQuery } from "react-query";
import NoDataFound from "../components/shared/no-data-found/NoDataFound";
import { FAQSkeletons } from "../components/shared/skeletons/HomePageSkeletons";
import { ConnectSVG } from "../assets/icons/Home";
import EditorText from "../components/shared/editor-text/EditorText";
import { useSelector } from "react-redux";

const ContactUs = () => {
  const {
    data: faqs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["faq"],
    queryFn: () =>
      getFAQContent().then((res) => {
        return res?.data?.data;
      }),
  });

  const [content, setContent] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState("");

  useEffect(() => {
    setContent(faqs?.map((el, index) => ({ ...el, id: index })));
    window.scrollTo(0, 0);
  }, [faqs]);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? "" : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center gap-16">
        {/* Contact Form Section */}
        <ContactForm />

        {/* FAQ Section */}

        <div className="flex flex-col gap-[4rem] w-full">
          <div className="flex flex-col gap-[1rem] text-center">
            <div className="flex flex-row items-end justify-center gap-[0.5rem]">
              <p className={"font-semibold text-content-600 text-lg"}>
                Easy and Fast
              </p>
              <ConnectSVG flip={true} />
            </div>
            <h2 className="text-4xl font-bold">Frequently asked questions</h2>
            <p className="text-gray-600">
              Subscribe to learn about new product features, the latest in
              technology, solutions, and updates.
            </p>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <FAQSkeletons />
            ) : !content || content?.length === 0 ? (
              <NoDataFound
                text={
                  "We couldn't find any FAQs right now. If you have questions, feel free to contact us!"
                }
              />
            ) : (
              content?.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-gray-900">
                      {faq?.question}
                    </span>
                    {expandedFaq === faq.id ? (
                      <RemoveIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <AddIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <EditorText
                      htmlContent={faq?.answer || ""}
                      classNames={"px-6 pb-4 text-gray-600"}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
