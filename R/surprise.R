
# Pull the entropy library to later calculate KL Divergence
install.packages('entropy', dependencies = TRUE)
library(entropy)
library(tidyr)
library(dplyr)


setwd("~/Hacking/Berkeley/W209/209Final")
crimes<-read.csv("./Category_Crime_agg.csv")
pop_zip<-read.csv("./pop_by_zip.csv")

# Force the column names to match what is in the crimes file
colnames(pop_zip) <- c("zipcode", "pop")

# Merge the crimes and population files
crimes <- merge(crimes, pop_zip, by="zipcode")
crimes$zipcode <- as.factor(crimes$zipcode)
crimes$PrimaryType <- as.factor(crimes$PrimaryType)

# drop 2017
crimes <- subset(crimes, Year != "2017")
crimes$CrimesPerThousand <- crimes$Count*1000/crimes$pop


# for each year and crime type, compute average crime rate per 1000 people 

prior <- as.data.frame(crimes  %>% group_by(Year, PrimaryType) %>% summarise(CitywideCrimesPerThousand = sum(Count)*1000/sum(pop_zip)))
merged_data <- merge(x = crimes, y = prior, 
                    by = c("Year","PrimaryType"), all.x = T)

merged_data$SurpriseRatio <- merged_data$CrimesPerThousand/merged_data$CitywideCrimesPerThousand
output_data <- (merged_data %>% arrange(Year, zipcode))[,c(1,3,2,4,8)]
head(output_data,100)

write.csv(output_data, file="./category_crime_agg.csv")
