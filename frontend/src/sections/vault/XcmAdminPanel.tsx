import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { isAddress, isHex } from "viem";
import { toast } from "react-hot-toast";
import XcmGatewayJson from "../../contracts/XcmGateway.json";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
const DEFAULT_XCM_MESSAGE = "0x050c000401000003008c86471301000003008c8647000d010101000000010100368e8759910dab756d344995f1d3c79374ca8f70066d3a709e48029f6bf0ee7e";
const DEFAULT_XCM_DESTINATION = "0x0000000378";

const XcmAdminPanel = () => {
  const { address: walletAddress } = useAccount();

  const [gatewayAddress, setGatewayAddress] = useState<string>("");
  const [messageHex, setMessageHex] = useState<string>(DEFAULT_XCM_MESSAGE);
  const [destinationHex, setDestinationHex] = useState<string>(DEFAULT_XCM_DESTINATION);

  const isValidGatewayAddress = isAddress(gatewayAddress);
  const isValidMessage = isHex(messageHex);
  const isValidDestination = isHex(destinationHex);

  const gatewayAddressOrZero = (isValidGatewayAddress ? gatewayAddress : ZERO_ADDRESS) as `0x${string}`;

  const { data: ownerAddress, refetch: refetchOwner } = useReadContract({
    address: gatewayAddressOrZero,
    abi: XcmGatewayJson.abi,
    functionName: "owner",
    query: { enabled: isValidGatewayAddress },
  });

  const isOwner = useMemo(() => {
    if (!walletAddress || !ownerAddress) return false;
    return walletAddress.toLowerCase() === String(ownerAddress).toLowerCase();
  }, [walletAddress, ownerAddress]);

  const {
    writeContractAsync,
    data: txHash,
    isPending,
  } = useWriteContract();

  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTxConfirmed) {
      toast.success("XCM transaction confirmed");
      refetchOwner();
    }
  }, [isTxConfirmed, refetchOwner]);

  const runWeigh = async () => {
    if (!isValidGatewayAddress) {
      toast.error("Enter a valid gateway address");
      return;
    }

    if (!isValidMessage) {
      toast.error("Message must be hex (0x...)");
      return;
    }

    if (!isOwner) {
      toast.error("Only gateway owner can call this action");
      return;
    }

    try {
      await writeContractAsync({
        address: gatewayAddressOrZero,
        abi: XcmGatewayJson.abi,
        functionName: "weighXcmMessage",
        args: [messageHex as `0x${string}`],
      });
    } catch (error) {
      console.error(error);
      toast.error("Weigh transaction failed");
    }
  };

  const runExecute = async () => {
    if (!isValidGatewayAddress) {
      toast.error("Enter a valid gateway address");
      return;
    }

    if (!isValidMessage) {
      toast.error("Message must be hex (0x...)");
      return;
    }

    if (!isOwner) {
      toast.error("Only gateway owner can call this action");
      return;
    }

    try {
      await writeContractAsync({
        address: gatewayAddressOrZero,
        abi: XcmGatewayJson.abi,
        functionName: "executeXcmMessage",
        args: [messageHex as `0x${string}`],
      });
    } catch (error) {
      console.error(error);
      toast.error("Execute transaction failed");
    }
  };

  const runSend = async () => {
    if (!isValidGatewayAddress) {
      toast.error("Enter a valid gateway address");
      return;
    }

    if (!isValidDestination || !isValidMessage) {
      toast.error("Destination and message must be hex (0x...)");
      return;
    }

    if (!isOwner) {
      toast.error("Only gateway owner can call this action");
      return;
    }

    try {
      await writeContractAsync({
        address: gatewayAddressOrZero,
        abi: XcmGatewayJson.abi,
        functionName: "sendXcmMessage",
        args: [destinationHex as `0x${string}`, messageHex as `0x${string}`],
      });
    } catch (error) {
      console.error(error);
      toast.error("Send transaction failed");
    }
  };

  const busy = isPending || isTxConfirming;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0a18]/90 p-6 shadow-2xl">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-white">Track 2 XCM Admin</h3>
        <p className="text-sm text-white/60 mt-1">
          Owner-only gateway actions for weigh, execute, and send via XCM precompile.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="text-xs text-white/60 uppercase tracking-wider">XCM Gateway Address</label>
        <input
          value={gatewayAddress}
          onChange={(e) => setGatewayAddress(e.target.value.trim())}
          placeholder="0x..."
          className="w-full rounded-xl border border-white/10 bg-[#120f24] px-4 py-3 text-white outline-none focus:border-purple-500/40 caret-white"
        />

        <div className="text-xs text-white/60">
          Connected: {walletAddress ? walletAddress : "not connected"}
        </div>
        <div className="text-xs text-white/60">
          Gateway owner: {ownerAddress ? String(ownerAddress) : "unknown"}
        </div>
        <div className={`text-xs ${isOwner ? "text-emerald-400" : "text-amber-400"}`}>
          {isOwner ? "Owner verified" : "Owner not verified"}
        </div>

        <label className="text-xs text-white/60 uppercase tracking-wider">XCM Message Hex</label>
        <textarea
          value={messageHex}
          onChange={(e) => setMessageHex(e.target.value.trim())}
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-[#120f24] px-4 py-3 text-white outline-none focus:border-purple-500/40 caret-white"
        />

        <label className="text-xs text-white/60 uppercase tracking-wider">XCM Destination Hex</label>
        <input
          value={destinationHex}
          onChange={(e) => setDestinationHex(e.target.value.trim())}
          className="w-full rounded-xl border border-white/10 bg-[#120f24] px-4 py-3 text-white outline-none focus:border-purple-500/40 caret-white"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={runWeigh}
            disabled={busy || !isOwner || !isValidGatewayAddress || !isValidMessage}
            className="rounded-xl bg-indigo-500/20 border border-indigo-400/30 px-4 py-3 text-indigo-200 disabled:opacity-50"
          >
            {busy ? "Processing..." : "Weigh Message"}
          </button>
          <button
            type="button"
            onClick={runExecute}
            disabled={busy || !isOwner || !isValidGatewayAddress || !isValidMessage}
            className="rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-4 py-3 text-emerald-200 disabled:opacity-50"
          >
            {busy ? "Processing..." : "Execute Message"}
          </button>
          <button
            type="button"
            onClick={runSend}
            disabled={busy || !isOwner || !isValidGatewayAddress || !isValidMessage || !isValidDestination}
            className="rounded-xl bg-cyan-500/20 border border-cyan-400/30 px-4 py-3 text-cyan-200 disabled:opacity-50"
          >
            {busy ? "Processing..." : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default XcmAdminPanel;
