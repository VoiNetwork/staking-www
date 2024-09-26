import styled from "@emotion/styled";
import { Copy } from "lucide-react";
import React from "react";

const Wrapper=styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    cursor: pointer;
    .copied{
        position: absolute;
        right: 0;
        top: 0;
        background: #6f2ae2;
        color: #fff;
        padding: 2px 10px;
        border-radius: 5px;
        font-size: 12px;
        transform: translate(100%, -100%);
        /* transform: translateY(-100%); */
    }
`
const CopyText = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return (
    <Wrapper className="relative">
       
      <Copy onClick={handleCopy} size={15} />
      {copied&&<div className="absolute copied">Copied</div>}
    </Wrapper>
  );
};

export default CopyText;
