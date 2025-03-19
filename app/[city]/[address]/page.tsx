import AddressView from "@/components/address-view"

export default function AddressPage({
  params,
}: {
  params: { city: string; address: string }
}) {
  return <AddressView city={decodeURIComponent(params.city)} address={decodeURIComponent(params.address)} />
}

