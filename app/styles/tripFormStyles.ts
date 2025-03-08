import { StyleSheet } from "react-native";

const tripFormStyles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "semibold",
    marginBottom: 50,
    marginTop: 30,
    textAlign: "center",
    color: "rgb(16, 89, 138)",
  },
  label: {
    fontSize: 18,
    fontWeight: "semibold",
    marginBottom: 5,
    color: "rgb(16, 89, 138)",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 25,
    borderRadius: 15,
    borderColor: "rgb(200, 200, 200)",
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 35,
    borderColor: "rgb(41, 100, 182)",
    backgroundColor: "rgb(230, 227, 227)",
  },
  button_generate: {
    backgroundColor: "rgb(16, 89, 138)",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,

  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "semibold",
  },
});

export default tripFormStyles;