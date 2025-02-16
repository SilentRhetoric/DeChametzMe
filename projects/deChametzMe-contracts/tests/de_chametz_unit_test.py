from collections.abc import Iterator

import algopy
import pytest
from algopy import Asset
from algopy_testing import AlgopyTestContext, algopy_testing_context

from smart_contracts.de_chametz.contract import DeChametz

# The unit tests here leverage the Algorand Python Testing framework
# https://algorandfoundation.github.io/algorand-python-testing
# This file currently performs three separate tests that are
# wholly independent of one another and do not share state


@pytest.fixture()
def context() -> Iterator[AlgopyTestContext]:
    with algopy_testing_context() as ctx:
        yield ctx


def test_bootstrap(context: AlgopyTestContext) -> None:
    # Arrange
    contract = DeChametz()

    # Act
    created_asset = contract.bootstrap()

    # Assert
    assert created_asset == contract.token_asset_id


def test_sell_chametz(context: AlgopyTestContext) -> None:
    # Arrange
    contract = DeChametz()

    # First, we bootstrap the app, which creates the ASA
    created_asset = contract.bootstrap()
    assert created_asset == contract.token_asset_id

    # Next, the caller needs to opt in to the ASA
    context.ledger.update_asset_holdings(
        created_asset.native, context.default_sender, balance=0
    )
    assert context.default_sender.is_opted_in(Asset(created_asset.native))

    dummy_input = context.any.string(length=10)

    # Act
    # The sender sells the chametz
    # The method is decorated to be called on opt_in, and this is
    # is handled automatically by the testing framework
    output = contract.sell_chametz(dummy_input)

    # Assert
    # Check the transaction return value
    assert output.bytes == algopy.arc4.String(dummy_input).bytes[2:]
    # Check that the sender's local state was updated
    assert dummy_input.bytes == context.ledger.get_local_state(
        contract, context.default_sender, b"chametz_sold"
    )
    # Check that the token was transferred back to the contract
    axfer_itxn = context.txn.last_group.get_itxn_group(-1).asset_transfer(0)
    assert axfer_itxn.asset_receiver == context.default_sender
    assert axfer_itxn.asset_amount == 1


def test_repurchase_chametz(context: AlgopyTestContext) -> None:
    # Arrange
    contract = DeChametz()

    # First, we bootstrap the app, which creates the ASA
    created_asset = contract.bootstrap()

    # Now, we need to opt in to the ASA
    context.ledger.update_asset_holdings(
        created_asset.native, context.default_sender, balance=0
    )
    # First sell the chametz
    dummy_input = context.any.string(length=10)
    output = contract.sell_chametz(dummy_input)
    context.ledger.update_asset_holdings(
        created_asset.native, context.default_sender, balance=1
    )

    # Act
    # The sender repurchases the chametz
    # The method is decorated to be called on opt_out, and this is
    # is handled automatically by the testing framework
    output = contract.repurchase_chametz()

    # Assert
    # Check the transaction return value
    assert output.bytes == algopy.arc4.String(dummy_input).bytes[2:]
    # Check that the token was transferred back to the contract
    axfer_itxn = context.txn.last_group.get_itxn_group(-1).asset_transfer(0)
    assert axfer_itxn.asset_sender == context.default_sender
    assert axfer_itxn.asset_amount == 1
