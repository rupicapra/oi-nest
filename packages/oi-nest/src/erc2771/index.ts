import { OiContractBundle } from '@openibex/chain';
import { Erc2771Abi } from './abi';
import { Erc2771Api } from './api';
import { ERC2771Connector } from './connector';
import { OnPluginInitHook } from '@openibex/core';


@OnPluginInitHook('openibex.ethereum', 'registring erc2771')
class Erc2771Bundle extends OiContractBundle {}
export default new Erc2771Bundle('eip155', 'erc2771', Erc2771Abi, Erc2771Api, ERC2771Connector);