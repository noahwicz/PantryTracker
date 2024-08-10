"use client";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
} from "@mui/material";
// import { TextareaAutosize } from "@mui/base/TextareaAutosize";
// import { styled } from "@mui/system";

import { firestore } from "@/firebase";

import {
  collection,
  getDocs,
  query,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  count,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import React from "react";

export default function Home() {
  // using useState to store the pantry items
  const [pantry, setPantry] = useState([]);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // useState for adding the item name
  const [itemName, setItemName] = useState("");

  // useState for the search item
  const [searchItem, setSearchItem] = useState("");

  // async code does not work inside useEffect
  // so we are creating the updatePantry function outside of useEffect
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    setPantry(pantryList);
  };

  // we are using useEffect to get pantry items from firestore
  useEffect(() => {
    updatePantry();
  }, []);

  // function to handle pantry item search
  const searchPantry = async (item) => {
    const snapshot = await getDocs(collection(firestore, "pantry"));
    const pantryList = [];
    snapshot.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });

    // Filter items that contain the search term
    const filteredPantry = pantryList.filter((pantryItem) =>
      pantryItem.name.toLowerCase().includes(item.toLowerCase())
    );

    setPantry(filteredPantry);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);

    // check if the item already exists in the pantry
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
      // console.log(item);
    }
    await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count > 1) {
        await setDoc(docRef, { count: count - 1 });
      } else {
        await deleteDoc(docRef);
      }
    }
    await updatePantry();
  };

  const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={"column"}
      gap={2}
    >
      <Box border={"2px solid #333"}>
        <Box
          width="800px"
          height="100px"
          bgcolor={"#ADD8E6"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant={"h2"} textAlign={"center"} color={"#333"}>
            Pantry Items
          </Typography>
        </Box>

        <Box
          width="800px"
          height="100px"
          bgcolor={"#ADD8E6"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          paddingX={5}
          gap={"10px"}
        >
          <TextField
            id="filled-search"
            label="Search field"
            type="search"
            variant="filled"
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            // textAlign={"center"}
            fullWidth
          />
          <Button variant="contained" onClick={() => searchPantry(searchItem)}>
            Search
          </Button>
        </Box>

        <Stack width="800px" height="500px" spacing={2} overflow={"auto"}>
          {/* map every time in the pantry array */}
          {pantry.map(({ name, count }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              bgcolor={"lightgray"}
              paddingX={5}
            >
              <Typography variant={"h3"} color={"#333"} textAlign={"center"}>
                {
                  // Captilize the first letter of the item
                  name.charAt(0).toUpperCase() + name.slice(1)
                }
              </Typography>

              <Typography variant={"h3"} color={"#333"} textAlign={"center"}>
                Quantity: {count}
              </Typography>

              <Button variant="contained" onClick={() => removeItem(name)}>
                Delete
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleModal}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Insert Pantry Item
          </Typography>
          <Stack width={"100%"} spacing={2} direction={"row"}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                handleClose();
                setItemName("");
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="outlined" onClick={handleOpen}>
        Add New Item
      </Button>
    </Box>
  );
}
