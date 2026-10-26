const config = {
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo:27017" }
  ]
};

try {
  rs.status();
  print("Replica Set rs0 is already initialized.");
} catch (error) {
  if (error.code === 94 || error.codeName === "NotYetInitialized") {
    printjson(rs.initiate(config));
  } else {
    throw error;
  }
}
