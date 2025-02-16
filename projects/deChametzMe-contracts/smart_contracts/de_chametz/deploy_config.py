import logging

from algokit_utils import (
    AlgoAmount,
    AlgorandClient,
    OnSchemaBreak,
    OnUpdate,
    OperationPerformed,
    PaymentParams,
)

logger = logging.getLogger(__name__)


# Define deployment behaviour based on supplied app spec
def deploy() -> None:
    from smart_contracts.artifacts.de_chametz.de_chametz_client import (
        DeChametzFactory,
    )

    algorand = AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        DeChametzFactory, default_sender=deployer_.address
    )

    app_client, result = factory.deploy(
        on_update=OnUpdate.AppendApp,
        on_schema_break=OnSchemaBreak.AppendApp,
    )

    if result.operation_performed in [
        OperationPerformed.Create,
        OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            PaymentParams(
                amount=AlgoAmount(micro_algo=200_000),
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )
