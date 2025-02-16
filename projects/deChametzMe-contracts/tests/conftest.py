import subprocess
import time

import pytest
from algokit_utils import (
    AlgoAmount,
    AlgorandClient,
    OnSchemaBreak,
    OnUpdate,
    SigningAccount,
)
from algokit_utils.config import config
from artifacts.de_chametz.de_chametz_client import DeChametzClient, DeChametzFactory

# Uncomment if you want to load network specific or generic .env file
# @pytest.fixture(autouse=True, scope="session")
# def environment_fixture() -> None:
#     env_path = Path(__file__).parent.parent / ".env"
#     load_dotenv(env_path)

config.configure(
    debug=True,
    populate_app_call_resources=True,
    # trace_all=True, # uncomment to trace all transactions
)


# NOTE: This resets Localnet before testing for a clean chain
def pytest_sessionstart(session: pytest.Session) -> None:
    args = ["algokit", "localnet", "reset"]
    result = subprocess.run(args, capture_output=True, text=True, check=True)
    print(f"Before session start - result: {result}")
    time.sleep(10)


@pytest.fixture(scope="session")
def algorand_client() -> AlgorandClient:
    """Get an AlgorandClient instance configured for LocalNet"""
    return AlgorandClient.default_localnet()


@pytest.fixture(scope="session")
def deployer(algorand_client: AlgorandClient) -> SigningAccount:
    algorand = AlgorandClient.default_localnet()
    deployer = algorand.account.from_environment("DEPLOYER", AlgoAmount.from_algo(10))
    return deployer


@pytest.fixture(scope="session")
def caller(algorand_client: AlgorandClient) -> SigningAccount:
    algorand = AlgorandClient.default_localnet()
    caller = algorand.account.from_environment("CALLER", AlgoAmount.from_algo(10))
    return caller


@pytest.fixture(scope="session")
def de_chametz_app_client(
    algorand_client: AlgorandClient, deployer: SigningAccount
) -> DeChametzClient:
    factory = algorand_client.client.get_typed_app_factory(
        DeChametzFactory,
        default_sender=deployer.address,
        default_signer=deployer.signer,
    )

    client, result = factory.deploy(
        on_schema_break=OnSchemaBreak.AppendApp,
        on_update=OnUpdate.AppendApp,
    )
    return client
