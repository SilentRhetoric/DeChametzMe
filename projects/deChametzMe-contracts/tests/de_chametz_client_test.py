from algokit_utils import (
    AssetOptInParams,
    CommonAppCallParams,
    FundAppAccountParams,
    SendAtomicTransactionComposerResults,
    SigningAccount,
)
from algokit_utils.models.amount import AlgoAmount

from smart_contracts.artifacts.de_chametz.de_chametz_client import (
    DeChametzClient,
)

chametz_description = "Chametz to be sold"


# Note that this can only be called once because the contract panics if this
# method is called and a token has already been created and set in global state
def test_bootstrap_contract(
    deployer: SigningAccount, de_chametz_app_client: DeChametzClient
) -> None:
    de_chametz_app_client.algorand.set_signer_from_account(deployer.signer)

    # Skip if the contract has already been bootstrapped
    if de_chametz_app_client.state.global_state.token_asset_id > 0:
        return

    # Else proceed with bootstrapping the contract to create its token
    de_chametz_app_client.app_client.fund_app_account(
        FundAppAccountParams(amount=AlgoAmount.from_micro_algo(200_000))
    )
    result = de_chametz_app_client.send.bootstrap_contract(
        params=CommonAppCallParams(static_fee=AlgoAmount.from_micro_algo(2000))
    )
    assert result.abi_return > 0
    created_asset = de_chametz_app_client.state.global_state.token_asset_id
    assert result.abi_return == created_asset


def test_sell_chametz(
    caller: SigningAccount, de_chametz_app_client: DeChametzClient
) -> None:
    de_chametz_app_client.algorand.set_signer_from_account(caller.signer)
    token_id = de_chametz_app_client.state.global_state.token_asset_id

    result: SendAtomicTransactionComposerResults = (
        de_chametz_app_client.new_group()
        .add_transaction(
            de_chametz_app_client.app_client.algorand.create_transaction.asset_opt_in(
                AssetOptInParams(
                    asset_id=token_id, sender=caller.address, signer=caller.signer
                )
            )
        )
        .opt_in.sell_chametz(
            args=(chametz_description,),
            params=CommonAppCallParams(
                sender=caller.address,
                signer=caller.signer,
                static_fee=AlgoAmount.from_micro_algo(2000),
            ),
        )
        .send()
    )
    assert result.returns[0].value == chametz_description


def test_repurchase_chametz(
    caller: SigningAccount, de_chametz_app_client: DeChametzClient
) -> None:
    de_chametz_app_client.algorand.set_signer_from_account(caller.signer)
    result = de_chametz_app_client.send.close_out.repurchase_chametz(
        params=CommonAppCallParams(
            sender=caller.address,
            signer=caller.signer,
            static_fee=AlgoAmount.from_micro_algo(2000),
        ),
    )
    assert result.returns[0].value == chametz_description
