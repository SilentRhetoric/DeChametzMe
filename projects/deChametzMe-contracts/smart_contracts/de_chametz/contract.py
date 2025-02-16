from algopy import (
    ARC4Contract,
    Asset,
    Bytes,
    Global,
    LocalState,
    String,
    Txn,
    UInt64,
    arc4,
    itxn,
)


# A Struct to be used in ARC-28 events with details of a sale of chametz
class Sale(arc4.Struct):
    seller: arc4.Address
    time: arc4.UInt64
    chametz_sold: arc4.String


# A Struct to be used in ARC-28 events with details of a repo of chametz
class Repurchase(arc4.Struct):
    buyer: arc4.Address
    time: arc4.UInt64
    chametz_repurchased: arc4.String


class DeChametz(ARC4Contract):
    def __init__(self) -> None:
        # Using native Algorand Python types here so they look nice on Lora :)
        self.is_jewish = String("no")
        self.token_asset_id = UInt64(0)
        self.chametz_sold = LocalState(
            Bytes,
            key="chametz_sold",
            description="Description of the chametz sold",
        )

    @arc4.abimethod(name="Bootstrap contract")
    def bootstrap(self) -> arc4.UInt64:  # Returning an ARC-4 UInt64
        assert Txn.sender == Global.creator_address
        assert self.token_asset_id == 0
        self.token_asset_id = (
            itxn.AssetConfig(
                total=10000000,
                decimals=0,
                default_frozen=True,
                asset_name="ForChametz",
                unit_name="4CHAMETZ",
                url="https://dechametz.me",
                manager=Global.current_application_address,
                reserve=Global.current_application_address,
                freeze=Global.current_application_address,
                clawback=Global.current_application_address,
                fee=0,
            )
            .submit()
            .created_asset.id
        )
        return arc4.UInt64(self.token_asset_id)

    # This method uses account LocalStorage, so it is bound to OnComplete=OptIn
    @arc4.abimethod(allow_actions=["OptIn"], name="Sell chametz")
    def sell_chametz(self, chametz: arc4.String) -> arc4.String:
        # The sender must not be holding a ForChametz token already
        assert (
            Asset(self.token_asset_id).balance(Txn.sender) == 0
        ), "Must not be holding a ForChametz token already to sell chametz"

        # Update the sender's local state with the chametz's description
        self.chametz_sold[Txn.sender] = chametz.bytes

        # Transfer the token to the sender using clawback (see asset_sender)
        itxn.AssetTransfer(
            xfer_asset=self.token_asset_id,
            asset_amount=1,
            sender=Global.current_application_address,
            asset_sender=Global.current_application_address,
            asset_receiver=Txn.sender,
            note=b"Sell" + chametz.bytes,
            fee=0,
        ).submit()

        # Emitting an ARC-28 event with an ARC-4 Struct of ARC-4 typed fields
        arc4.emit(
            Sale(
                seller=arc4.Address(Txn.sender),
                time=arc4.UInt64(Global.latest_timestamp),
                chametz_sold=arc4.String.from_bytes(chametz.bytes),
            )
        )
        return arc4.String.from_bytes(chametz.bytes)

    # This method clears account LocalStorage, so it is bound to OnComplete=CloseOut
    @arc4.abimethod(allow_actions=["CloseOut"], name="Repurchase chametz")
    def repurchase_chametz(self) -> arc4.String:
        # Initial checks on the sender
        assert (
            Asset(self.token_asset_id).balance(Txn.sender) == 1
        ), "Must hold a ForChametz token to repurchase chametz"

        # Transfer the token back to the app using clawback (see asset_sender)
        itxn.AssetTransfer(
            xfer_asset=self.token_asset_id,
            asset_amount=1,
            sender=Global.current_application_address,
            asset_sender=Txn.sender,
            asset_receiver=Global.current_application_address,
            note=b"Repurchase" + self.chametz_sold[Txn.sender],
            fee=0,
        ).submit()

        chametz_repurchased = self.chametz_sold[Txn.sender]

        # Emitting an ARC-28 event with an ARC-4 Struct of ARC-4 typed fields
        arc4.emit(
            Repurchase(
                buyer=arc4.Address(Txn.sender),
                time=arc4.UInt64(Global.latest_timestamp),
                chametz_repurchased=arc4.String.from_bytes(chametz_repurchased),
            )
        )
        return arc4.String.from_bytes(chametz_repurchased)
