import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time

class ToDoListUITests(unittest.TestCase):
    def setUp(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        self.driver = webdriver.Chrome(options=chrome_options)
        self.base_url = "http://localhost:5173"

    def test_login_flow(self):
        driver = self.driver
        driver.get(f"{self.base_url}/login")
        
        # Fill login form
        driver.find_element(By.NAME, "username").send_keys("admin") # Assumes user 'admin' exists
        driver.find_element(By.NAME, "password").send_keys("admin")
        driver.find_element(By.CLASS_NAME, "auth-button").click()
        
        time.sleep(2) # Wait for redirect
        
        # Check if dashboard is loaded
        self.assertIn("Dashboard", driver.page_source)
        self.assertIn("TaskMaster", driver.page_source)

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
