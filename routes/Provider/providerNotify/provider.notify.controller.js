const { getNotificationService } = require("./provider.notify.service");

module.exports = {
    providerNotifyController: async (req, res) => {

    },
    getProviderNotivicationController: async (req, res) => {
        const { providerId } = req.query;
        if (!providerId) {
            return res.status(400).json({ message: 'providerId is required' })
        }
        try {
            getNotificationService(providerId, (err, result) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ message: 'Internal Server Error' })
                }
                return res.status(200).json({ message: 'Success', data: result })
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Internal Server Error' })
        }
    }
}