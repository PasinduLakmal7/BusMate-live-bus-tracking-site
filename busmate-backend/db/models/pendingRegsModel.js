const { Model } = require('objection');

class PendingRegistration extends Model {
    static get tableName() {
        return 'pending_registrations';
    }

    static get idColumn() {
        return 'pending_id';
    }

    // Hide sensitive fields in API responses
    $formatJson(json) {
        json = super.$formatJson(json);
        delete json.password_hash;
        return json;
    }

    $beforeInsert() {
        if (!this.status) this.status = 'pending';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [
                'full_name',
                'phone',
                'nic',
                'email',
                'password_hash',
                'license_number',
                'license_expiry',
                'bus_number',
            ],
            properties: {
                pending_id: { type: 'integer' },

                // Driver
                full_name: { type: 'string', minLength: 3, maxLength: 120 },
                phone: { type: 'string', minLength: 9, maxLength: 20 },
                nic: { type: 'string', minLength: 8, maxLength: 20 },
                email: { type: 'string', format: 'email', maxLength: 100 },
                password_hash: { type: 'string', minLength: 20 },
                driver_photo_url: { type: ['string', 'null'], maxLength: 500 },

                // License
                license_number: { type: 'string', minLength: 5, maxLength: 50 },
                license_expiry: { type: 'string', format: 'date' },
                license_photo_url: { type: ['string', 'null'], maxLength: 500 },

                // Bus
                bus_number: { type: 'string', minLength: 3, maxLength: 30 },
                bus_type: { type: ['string', 'null'], maxLength: 50 },
                depot_name: { type: ['string', 'null'], maxLength: 150 },

                // Conductor
                conductor_name: { type: ['string', 'null'], maxLength: 120 },
                conductor_nic: { type: ['string', 'null'], maxLength: 20 },
                conductor_phone: { type: ['string', 'null'], maxLength: 20 },
                conductor_photo_url: { type: ['string', 'null'], maxLength: 500 },

                // Route
                route_number: { type: ['string', 'null'], maxLength: 30 },
                route_name: { type: ['string', 'null'], maxLength: 200 },

                // Trips (array of objects)
                trips_json: {
                    type: ['array', 'null'],
                    items: {
                        type: 'object',
                        required: ['trip_no', 'start_time', 'end_time'],
                        properties: {
                            trip_no: { type: 'integer', minimum: 1, maximum: 50 },
                            start_time: { type: 'string', minLength: 4, maxLength: 8 }, // "06:00"
                            end_time: { type: 'string', minLength: 4, maxLength: 8 },   // "09:30"
                        },
                    },
                },

                // Status
                status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },

                created_at: { type: ['string', 'null'] },
            },
        };
    }

    static get modifiers() {
        return {
            pending(q) {
                q.where('status', 'pending').orderBy('created_at', 'desc');
            },
            approved(q) {
                q.where('status', 'approved').orderBy('created_at', 'desc');
            },
            rejected(q) {
                q.where('status', 'rejected').orderBy('created_at', 'desc');
            },
            byPhone(q, phone) {
                if (phone) q.where('phone', phone);
            },
            byNic(q, nic) {
                if (nic) q.where('nic', nic);
            },
        };
    }
}

module.exports = PendingRegistration;
