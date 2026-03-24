import './config'
import {bootstrap} from "@/app/bootstrap";

bootstrap()
    .then(() => {
        console.log('app running'.green.bold);
    })
    .catch((err) => {
        console.error(err);
    })

