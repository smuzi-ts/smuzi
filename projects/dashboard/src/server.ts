import { runServer } from '@smuzi/server';
import { CreateRouter } from '@smuzi/router';

const router = CreateRouter();

router.get('', () =>'Home')
router.get('users', () => 'Users')

Http2StrategyServer
