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
const CopyText = ({ text }: { text: string|number }) => {
  const [copyStatus, setCopyStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text?.toString());
      setCopyStatus('success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyStatus('error');
    }

    setTimeout(() => {
      setCopyStatus('idle');
    }, 2000);
  };

  if(!text) return <></>
  return (
    <Wrapper className="relative">
      <button
        onClick={handleCopy}
        aria-label="Copy to clipboard"
        title="Copy to clipboard"
      >
        <Copy size={15} />
      </button>
      {copyStatus === 'success' && <div className="absolute copied" role="status">Copied!</div>}
      {copyStatus === 'error' && <div className="absolute copied error" role="alert">Copy failed</div>}
    </Wrapper>
  );
};

export default CopyText;
