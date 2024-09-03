document.addEventListener("DOMContentLoaded", function () {
  const startKeystrokeBtn = document.getElementById("startKeystroke");
  const stopKeystrokeBtn = document.getElementById("stopKeystroke");

  // Universal function to fetch endpoints
  async function sendCommand(url) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      console.log(result.status);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Update read data function call
  async function getReadData() {
    try {
      const response = await fetch("/getReadData");
      const result = await response.json();
      if (result.data == "PCD_Authenticate() failed: Error in communication." || result.data == "PCD_Authenticate() failed: Timeout in communication." || result.data == "MIFARE_Read() failed: The CRC_A does not match.") {
        document.getElementById("cardUID").value = "Try again";
        await sendCommand("/startRead");
      }
      else {
        // document.getElementById("cardUID").value = result.uid;
        document.getElementById("cardData").value = result.data;
      }

    } catch (error) {
      console.error("Error fetching read data:", error);
    }
  }

  // Load the ports into both the drop down menus
  function loadPorts() {
    fetch('/ports')
      .then(response => response.json())
      .then(data => {
        const portSelect = document.getElementById('port');
        portSelect.innerHTML = '';
        data.ports.forEach(port => {
          const option = document.createElement('option');
          option.value = port;
          option.text = port;
          portSelect.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Error fetching ports:', error);
      });
  }

  // upon selecting the ports and pressing connect, send the serialports and start the listener
  function connectSerialPort() {
    const IDcomPort = document.getElementById('IDport').value;
    const BookcomPort = document.getElementById('BookPort').value;
    fetch('/libraryPortConnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ IdPport: IDcomPort, BookPort: BookcomPort }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // enable the buttons once the listener is established
          startKeystrokeBtn.disabled = false;
          stopKeystrokeBtn.disabled = false;

          serialSelectBtn.classList.add("active");
          serialSelectBtn.textContent = "Connection Established";

          alert('Connected to ' + IDcomPort + ' and ' + BookcomPort);
        } else {
          alert('Failed to connect: ' + data.error);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  // Fetch endpoint to start the keystrokes thread
  startKeystrokeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    sendCommand("/startLibraryKeystroke/1")
  });

  // Fetch endpoint to stop the keystrokes thread
  stopKeystrokeBtn.addEventListener("click", (event) => {
    event.preventDefault()
    sendCommand("/startLibraryKeystroke/0")
  });

});