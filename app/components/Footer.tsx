import * as React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import {styles} from "../styles/homestyles"
interface FooterProps {
  Links: {
    Link: String;
    Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  }[];
  handleProfile: (email: string, cityName: string) => void

  email: string;
  cityName: string;
}

const Footer: React.FC<FooterProps> = ({Links, handleProfile, email, cityName}: FooterProps) => {
  return (
    <>
      <View style={styles.footMenu}>
        <View
          style={[
            styles.buttonsContainer2,
            // isSmallScreen && {
            //   flexDirection: "column",
            //   alignItems: "stretch",
            // },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            //onPress={() => handleProfile(email, cityData.name)}
          >
            <Text style={styles.buttonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleProfile(email, cityName)}
          >
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Footer;
