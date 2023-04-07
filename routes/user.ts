import { Router } from "express";
import { getUserCredits } from "../controllers/user";
import { generateNonce } from "siwe";
import { ErrorTypes, SiweMessage } from "siwe";

const router = Router();

router.post('/connect', async (req, res) => {
    try {
        const { message, signature } = req.body;
        if (!message) {
            res.status(422).json({ message: 'Expected prepareMessage object as body.' });
            return;
        }
        const siwe = new SiweMessage(message);
        const fields = await siwe.validate(signature);
        // @ts-ignore // TODO: Remove ts-ignore
        if (fields.nonce !== req.session.nonce) {
            res.status(422).send({
                message: `Invalid nonce.`,
            });
        }
        // @ts-ignore // TODO: Remove ts-ignore
        req.session.siwe = fields;
        // req.session.cookie.expires = new Date(fields.expirationTime);
        req.session.save();
        res.status(200).send('Session saved');
    } catch (err) {
        // @ts-ignore // TODO: Remove ts-ignore
        req.session.siwe = null;
        // @ts-ignore // TODO: Remove ts-ignore
        req.session.nonce = null;
        console.error(err);
        switch (err) {
            case ErrorTypes.EXPIRED_MESSAGE: {
                req.session.save(() => res.status(440).send({ message: (err as Error).message }));
                break;
            }
            case ErrorTypes.INVALID_SIGNATURE: {
                req.session.save(() => res.status(422).send({ message: (err as Error).message }));
                break;
            }
            default: {
                req.session.save(() => res.status(500).send({ message: (err as Error).message }));
                break;
            }
        }
    }
});

router.get('/credits', async (req, res) => {
    try {
        const { user } = req.query;
        const credits = await getUserCredits(user as string);
        res.status(200).send(credits);
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.delete('/disconnect', async (req, res) => {
    try {
        if (!req.session) {
            res.status(422).send('Session not found.');
        }
        const sessionId = req.session.id;
        req.session.destroy((err) => {
            if (err) {
                console.log('Error: ', err);
            } else {
                // @ts-ignore // TODO: Remove ts-ignore
                req.session = null;
                res.clearCookie(sessionId, { path: '/' }).send('Session cleared');
            }
        });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.get('/nonce', async (req, res) => {
    try {
        const nonce = generateNonce();
        // @ts-ignore // TODO: Remove ts-ignore
        req.session.nonce = nonce;
        res.status(200).send(nonce);
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.get('/reconnect', async (req, res) => {
    try {
        // @ts-ignore // TODO: Remove ts-ignore
        res.status(200).send({ hasSession: !!req.session.siwe });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

export default router;