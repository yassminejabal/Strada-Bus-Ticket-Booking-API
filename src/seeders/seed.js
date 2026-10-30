import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDirectly = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://mongo:27017/strada?replicaSet=rs0';
    await mongoose.connect(uri);
    console.log("🟢 Connected to MongoDB for Direct Seeding...");

    // 1. Users Collection
    const usersCollection = mongoose.connection.collection('users');
    const hashedPassword = await bcrypt.hash("Password123", 10);
    
    const usersData = [
      { fullName: "Admin Strada", email: "admin@strada.com", password: hashedPassword, role: "admin", createdAt: new Date(), updatedAt: new Date() },
      { fullName: "Yassmine Jabal", email: "yassmine@strada.com", password: hashedPassword, role: "passenger", createdAt: new Date(), updatedAt: new Date() },
      { fullName: "Agent Gare", email: "agent@strada.com", password: hashedPassword, role: "agent", createdAt: new Date(), updatedAt: new Date() }
    ];

    for (const user of usersData) {
      await usersCollection.updateOne(
        { email: user.email },
        { $set: user },
        { upsert: true }
      );
    }
    console.log("✅ Users seeded successfully.");

    // 2. Coach Collection (Attributs: registration, seatNumbers, isArchived)
    const coachCollection = mongoose.connection.collection('coaches');
    const coachesData = [
      { registration: "12345-A-6", seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isArchived: false, createdAt: new Date(), updatedAt: new Date() },
      { registration: "98765-B-22", seatNumbers: [1, 2, 3, 4, 11, 12, 15, 16], isArchived: false, createdAt: new Date(), updatedAt: new Date() }
    ];

    for (const coach of coachesData) {
      await coachCollection.updateOne(
        { registration: coach.registration },
        { $set: coach },
        { upsert: true }
      );
    }
    console.log("✅ Coaches seeded successfully.");

    // 3. City Collection (Attributs: name)
    const cityCollection = mongoose.connection.collection('cities');
    const citiesData = [
      { name: "Casablanca" },
      { name: "Marrakech" },
      { name: "Agadir" }
    ];

    const insertedCities = [];
    for (const city of citiesData) {
      let existingCity = await cityCollection.findOne({ name: city.name });
      if (!existingCity) {
        const res = await cityCollection.insertOne(city);
        insertedCities.push({ _id: res.insertedId, ...city });
      } else {
        insertedCities.push(existingCity);
      }
    }
    console.log("✅ Cities seeded successfully.");

    // 4. Stop Collection (Attributs: name, cityId)
    const stopCollection = mongoose.connection.collection('stops');
    const stopsData = [
      { name: "Gare CTM Casa", cityId: insertedCities[0]._id },
      { name: "Gare Bab Doukkala Marrakech", cityId: insertedCities[1]._id }
    ];

    const insertedStops = [];
    for (const stop of stopsData) {
      let existingStop = await stopCollection.findOne({ name: stop.name });
      if (!existingStop) {
        const res = await stopCollection.insertOne(stop);
        insertedStops.push({ _id: res.insertedId, ...stop });
      } else {
        insertedStops.push(existingStop);
      }
    }
    console.log("✅ Stops seeded successfully.");

    // 5. Line Collection (Attributs: code, label, stopIds, isArchived)
    const lineCollection = mongoose.connection.collection('lines');
    const linesData = [
      {
        code: "LINE-01",
        label: "Casa - Marrakech",
        stopIds: insertedStops.map(s => s._id),
        isArchived: false
      }
    ];

    const insertedLines = [];
    for (const line of linesData) {
      let existingLine = await lineCollection.findOne({ code: line.code });
      if (!existingLine) {
        const res = await lineCollection.insertOne(line);
        insertedLines.push({ _id: res.insertedId, ...line });
      } else {
        insertedLines.push(existingLine);
      }
    }
    console.log("✅ Lines seeded successfully.");

    // 6. Departure Collection (Attributs: lineId, coachId, departureAt, arrivalAt, fareCents, status, snapshot, revision)
    const departureCollection = mongoose.connection.collection('departures');
    const coachDoc = await coachCollection.findOne({ registration: "12345-A-6" });
    
    const departuresData = [
      {
        lineId: insertedLines[0]._id,
        coachId: coachDoc._id,
        departureAt: new Date('2027-03-15T09:00:00Z'),
        arrivalAt: new Date('2027-03-15T13:00:00Z'),
        fareCents: 15000,
        status: "OPEN",
        snapshot: {},
        revision: 1
      }
    ];

    const insertedDepartures = [];
    for (const dep of departuresData) {
      let existingDep = await departureCollection.findOne({ lineId: dep.lineId, departureAt: dep.departureAt });
      if (!existingDep) {
        const res = await departureCollection.insertOne(dep);
        insertedDepartures.push({ _id: res.insertedId, ...dep });
      } else {
        insertedDepartures.push(existingDep);
      }
    }
    console.log("✅ Departures seeded successfully.");

    // 7. Booking Collection (Attributs: passengerId, departureId, seatNumber, passengerName, priceCents, ticketCode, status, occupiesSeat, cancelReason, boardedAt)
    const bookingCollection = mongoose.connection.collection('bookings');
    const passengerUser = await usersCollection.findOne({ role: "passenger" });

    const bookingsData = [
      {
        passengerId: passengerUser._id,
        departureId: insertedDepartures[0]._id,
        seatNumber: 1,
        passengerName: passengerUser.fullName,
        priceCents: 15000,
        ticketCode: "TCK-998877",
        status: "CONFIRMED",
        occupiesSeat: true,
        cancelReason: null,
        boardedAt: null
      }
    ];

    const insertedBookings = [];
    for (const booking of bookingsData) {
      let existingBooking = await bookingCollection.findOne({ ticketCode: booking.ticketCode });
      if (!existingBooking) {
        const res = await bookingCollection.insertOne(booking);
        insertedBookings.push({ _id: res.insertedId, ...booking });
      } else {
        insertedBookings.push(existingBooking);
      }
    }
    console.log("✅ Bookings seeded successfully.");

    // 8. BoardingRecord Collection (Attributs: bookingId, departureId, agentId, checkedAt)
    const boardingCollection = mongoose.connection.collection('boardingrecords');
    const agentUser = await usersCollection.findOne({ role: "agent" });

    const boardingData = [
      {
        bookingId: insertedBookings[0]._id,
        departureId: insertedDepartures[0]._id,
        agentId: agentUser._id,
        checkedAt: new Date()
      }
    ];

    for (const record of boardingData) {
      const exists = await boardingCollection.findOne({ bookingId: record.bookingId });
      if (!exists) {
        await boardingCollection.insertOne(record);
      }
    }
    console.log("✅ BoardingRecords seeded successfully.");

    console.log("🎉 All tables seeded directly without models successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDirectly();