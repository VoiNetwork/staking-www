export async function pasteFromClipboard() {
  const part: {
    value: {
      voteFirst: number;
      voteLast: number;
      voteKeyDilution: number;
      selectionKey: string;
      voteKey: string;
      stateProofKey: string;
    };
  } = { value:{}} as any;
  const clip = await navigator.clipboard.readText();
  console.log({clip:clip.match(/(?<=^First\sround:\s*)\d*$/gm)![0]})
  part.value.voteFirst = Number(clip.match(/(?<=^First\sround:\s*)\d*$/gm)![0]);
  part.value.voteLast = Number(clip.match(/(?<=^Last\sround:\s*)\d*$/gm)![0]);
  part.value.voteKeyDilution = Number(
    clip.match(/(?<=^Key\sdilution:\s*)\d*$/gm)![0]
  );
  part.value.selectionKey = clip.match(/(?<=^Selection\skey:\s*)[^\s]*$/gm)![0];
  part.value.voteKey = clip.match(/(?<=^Voting\skey:\s*)[^\s]*$/gm)![0];
  part.value.stateProofKey = clip.match(
    /(?<=^State\sproof\skey:\s*)[^\s]*$/gm
  )![0];
  return part;
}
